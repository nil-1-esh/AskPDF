import { PDFParse } from 'pdf-parse';

export const extractPdfText = async (buffer) => {
    const parser = new PDFParse({ data: buffer });
    try {
        const result = await parser.getText();
        const pages = result.pages.map(page => ({
            pageNumber: page.num,
            text: page.text
        }));
        return {
            pages,
            totalPages: result.total
        };
    } finally {
        await parser.destroy();
    }
};