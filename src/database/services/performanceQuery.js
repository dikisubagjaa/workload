const dayjs = require('dayjs');

function resolvePeriod(parts = {}) {
    const now = dayjs();
    const year = Number(parts.year || now.format('YYYY'));
    const month = Number(parts.month || now.format('M'));
    return { year, month };
}

/**
 * Ambil skor bulan untuk 1 user (default: bulan berjalan).
 * Hasil: { base_score: 100, sum_score_value: number, final_score: 0..100 }
 */
async function getMonthlyScoreForUser(models, userId, period = {}) {
    const { year, month } = resolvePeriod(period);
    const sequelize = models.sequelize;

    const [rows] = await sequelize.query(
        `
    SELECT
      100 AS base_score,
      COALESCE(SUM(pel.score_value), 0) AS sum_score_value,
      GREATEST(0, LEAST(100, 100 + COALESCE(SUM(pel.score_value),0))) AS final_score
    FROM performance_event_log pel
    WHERE pel.user_id = :userId
      AND pel.period_year  = :yy
      AND pel.period_month = :mm
    `,
        { replacements: { userId, yy: year, mm: month } }
    );

    const row = Array.isArray(rows) ? rows[0] : rows;
    return row || { base_score: 100, sum_score_value: 0, final_score: 100 };
}

/**
 * Ambil skor bulan untuk banyak user (mis. bawahan Head), default bulan berjalan.
 * Options:
 *  - order: 'asc' | 'desc' (default 'asc' by final_score)
 *  - limit, offset: number (opsional)
 *  - minFinalScore: number (opsional, pakai HAVING final_score < :minFinalScore)
 *
 * Return: Array<{ user_id, base_score, sum_score_value, final_score }>
 */
async function getMonthlyScoresForUsers(models, userIds = [], period = {}, opts = {}) {
    if (!Array.isArray(userIds) || userIds.length === 0) return [];

    const { year, month } = resolvePeriod(period);
    const orderSql = (opts.order && opts.order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

    // Jangan bind LIMIT/OFFSET (beberapa driver MySQL/Sequelize nggak support)
    const limitSql = Number.isInteger(opts.limit) ? `LIMIT ${Math.max(0, opts.limit)}` : '';
    const offsetSql = Number.isInteger(opts.offset) ? `OFFSET ${Math.max(0, opts.offset)}` : '';

    // HAVING: hindari alias jika MySQL-mu rewel → pakai ekspresinya langsung
    const havingSql = (typeof opts.minFinalScore === 'number')
        ? `HAVING GREATEST(0, LEAST(100, 100 + COALESCE(SUM(pel.score_value),0))) < :minScore`
        : '';

    const sql = `
    SELECT
      pel.user_id,
      100 AS base_score,
      COALESCE(SUM(pel.score_value), 0) AS sum_score_value,
      GREATEST(0, LEAST(100, 100 + COALESCE(SUM(pel.score_value),0))) AS final_score
    FROM performance_event_log pel
    WHERE pel.user_id IN (:userIds)
      AND pel.period_year  = :yy
      AND pel.period_month = :mm
    GROUP BY pel.user_id
    ${havingSql}
    ORDER BY final_score ${orderSql}
    ${limitSql}
    ${offsetSql};
  `;

    const replacements = {
        userIds,           // ← array, Sequelize akan expand otomatis
        yy: year,
        mm: month,
    };
    if (typeof opts.minFinalScore === 'number') {
        replacements.minScore = opts.minFinalScore;
    }

    const [rows] = await models.sequelize.query(sql, { replacements });
    return rows || [];
}

/**
 * Ambil riwayat N bulan per user (default 12), termasuk bulan tanpa event (final_score = 100).
 * @param {*} models - sequelize models
 * @param {number} userId
 * @param {{ endYear?:number, endMonth?:number, months?:number }} period
 * @returns Array<{ period_year:number, period_month:number, period_start_date:string, base_score:100, sum_score_value:number, final_score:number }>
 */
async function getMonthlyHistoryForUser(models, userId, period = {}) {
    const now = dayjs();
    const endYear = Number(period.endYear || now.format('YYYY'));
    const endMonth = Number(period.endMonth || now.format('M'));
    const months = Number(period.months || 12);

    const endDate = dayjs(`${endYear}-${String(endMonth).padStart(2, '0')}-01`, 'YYYY-MM-DD', true);
    if (!endDate.isValid()) throw new Error('Invalid endYear/endMonth');

    const startDate = endDate.subtract(months - 1, 'month');
    const startYear = Number(startDate.format('YYYY'));
    const startMonth = Number(startDate.format('M'));

    const startYMonth = startYear * 100 + startMonth;
    const endYMonth = endYear * 100 + endMonth;

    const sql = `
    WITH RECURSIVE m AS (
      SELECT 0 AS k
      UNION ALL
      SELECT k + 1 FROM m WHERE k + 1 < :months
    ),
    cal AS (
      SELECT
        YEAR(DATE_SUB(STR_TO_DATE(CONCAT(:endYear,'-',LPAD(:endMonth,2,'0'),'-01'), '%Y-%m-%d'), INTERVAL k MONTH)) AS period_year,
        MONTH(DATE_SUB(STR_TO_DATE(CONCAT(:endYear,'-',LPAD(:endMonth,2,'0'),'-01'), '%Y-%m-%d'), INTERVAL k MONTH)) AS period_month,
        DATE_FORMAT(DATE_SUB(STR_TO_DATE(CONCAT(:endYear,'-',LPAD(:endMonth,2,'0'),'-01'), '%Y-%m-%d'), INTERVAL k MONTH), '%Y-%m-01') AS period_start_date
      FROM m
    )
    SELECT
      c.period_year,
      c.period_month,
      c.period_start_date,
      100 AS base_score,
      COALESCE(e.sum_score_value, 0) AS sum_score_value,
      GREATEST(0, LEAST(100, 100 + COALESCE(e.sum_score_value, 0))) AS final_score
    FROM cal c
    LEFT JOIN (
      SELECT period_year, period_month, SUM(score_value) AS sum_score_value
      FROM performance_event_log
      WHERE user_id = :userId
        AND (period_year*100 + period_month) BETWEEN :startYMonth AND :endYMonth
      GROUP BY period_year, period_month
    ) e
      ON e.period_year = c.period_year AND e.period_month = c.period_month
    ORDER BY c.period_year, c.period_month;
  `;

    const [rows] = await models.sequelize.query(sql, {
        replacements: {
            userId,
            months,
            endYear,
            endMonth,
            startYMonth,
            endYMonth,
        },
    });

    return rows || [];
}

module.exports = {
    getMonthlyScoreForUser,
    getMonthlyScoresForUsers,
    getMonthlyHistoryForUser,
};
