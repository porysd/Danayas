import { Hono } from "hono";    

const inquiryRoutes = new Hono();

inquiryRoutes.get("/" , async (c) => {
    return c.json({message: "All inquiries"});
});

inquiryRoutes.post("/" , async (c) => {
    return c.json({message: "Inquiry submitted"});
});

export default inquiryRoutes;