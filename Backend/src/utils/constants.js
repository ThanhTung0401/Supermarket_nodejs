export const CUSTOMER_RANKS = {
    BRONZE: { code: 'BRONZE', name: 'Đồng', minPoints: 0, discount: 0, color: '#CD7F32' },
    SILVER: { code: 'SILVER', name: 'Bạc', minPoints: 100, discount: 2, color: '#C0C0C0' },
    GOLD: { code: 'GOLD', name: 'Vàng', minPoints: 500, discount: 5, color: '#FFD700' },
    PLATINUM: { code: 'PLATINUM', name: 'Bạch Kim', minPoints: 1000, discount: 8, color: '#E5E4E2' },
    EMERALD: { code: 'EMERALD', name: 'Lục Bảo', minPoints: 2000, discount: 10, color: '#50C878' },
    RUBY: { code: 'RUBY', name: 'Ruby', minPoints: 5000, discount: 12, color: '#E0115F' },
    DIAMOND: { code: 'DIAMOND', name: 'Kim Cương', minPoints: 10000, discount: 15, color: '#B9F2FF' }
};

export const getRankByPoints = (points) => {
    const ranks = Object.values(CUSTOMER_RANKS).sort((a, b) => b.minPoints - a.minPoints);
    return ranks.find(rank => points >= rank.minPoints) || CUSTOMER_RANKS.BRONZE;
};