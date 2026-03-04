import { useMediaQuery } from "react-responsive";

export const useLargeDekstopQuery = () =>
    useMediaQuery({
        query: "(max-width: 1400px)",
    });
export const useDekstopQuery = () =>
    useMediaQuery({
        query: "(max-width: 1200px)",
    });

export const useLaptopQuery = () =>
    useMediaQuery({
        query: "(max-width: 992px)",
    });

export const useTabletQuery = () =>
    useMediaQuery({
        query: "(max-width: 768px)",
    });

export const useMobileQuery = () =>
    useMediaQuery({
        query: "(max-width: 576px)",
    });

export const useSmallMobileQuery = () =>
    useMediaQuery({
        query: "(max-width: 300px)",
    });