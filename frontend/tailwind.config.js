export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                paper: '#F5F4EF',
                'paper-alt': '#ECEAE2',
                ink: '#23282B',
                'ink-muted': '#6B7176',
                line: '#D9D5C8',
                brass: '#9C6B30',
                'brass-light': '#C99B5E',
                teal: '#2F6F62',
                'teal-light': '#E4EEEC'
            },
            fontFamily: {
                display: ['"Source Serif 4"', 'serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'monospace']
            }
        }
    },
    plugins: []
};