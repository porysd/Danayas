import { type Context } from 'hono';

export function getReportController (c: Context){
    return c.text("report");
}

// Added some controllers :>

export const createReport = async (c: any) => {
    return c.json({ message: "Report created!" });
};

export const getReport = async (c: any) => {
    return c.json({ message: "All of the reports"});
};
