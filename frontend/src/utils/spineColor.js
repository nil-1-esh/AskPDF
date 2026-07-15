const SPINE_COLORS = ['#9C6B30', '#2F6F62', '#5B6368', '#7A4B3A', '#3F5D52', '#8C5E2A'];

export const spineColor = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return SPINE_COLORS[Math.abs(hash) % SPINE_COLORS.length];
};