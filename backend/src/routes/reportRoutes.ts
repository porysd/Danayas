import { Hono } from "hono";

const reportRoutes = new Hono();

reportRoutes.get("/" , async (c) => {
    return c.json({message: "All reports"});
});

reportRoutes.post("/" , async (c) => {  
    return c.json({message: "Report submitted"});
});

export default reportRoutes;