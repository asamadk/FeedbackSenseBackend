import { SUPPORT_MAIL } from "../../../Helpers/Constants";

export const generateUpgradeSubEmailHtml = (username: string): string => {
    return `
    <!DOCTYPE html>
<html>
<head>
    <title>Congratulations on Upgrading Your Plan!</title>
</head>
<body>
    <h1>Dear ${username},</h1>
    <p>We wanted to extend our heartfelt congratulations on upgrading your plan with FeedbackSense! We appreciate your continued support and trust in our platform. This upgrade unlocks a whole new set of features and benefits to enhance your experience.</p>

    <p>We hope that the upgraded plan will empower you to achieve even greater success with your feedback collection and analysis efforts. If you have any questions or need assistance, our support team is always here to help. Feel free to reach out to us at ${SUPPORT_MAIL}</p>
    
    <p>Once again, thank you for choosing FeedbackSense. We value your partnership and look forward to serving you with the utmost dedication.</p>
    
    <p>Best regards,</p>
    <p>The FeedbackSense Team</p>
</body>
</html>

    `;
}