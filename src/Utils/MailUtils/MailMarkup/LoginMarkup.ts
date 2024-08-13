export const generateLoginEmailHtml = (username: string): string => {
    const emailHtml = /*html*/`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to RetainSense!</title>
        <style>
            /* Add your custom styles here */

            body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            h1 {
                color: #333333;
                text-align: center;
            }

            p {
                color: #666666;
                line-height: 1.5;
                margin-bottom: 20px;
            }

            .btn {
                display: inline-block;
                padding: 5px 25px;
                background-color: #006DFF;
                color: #ffffff;
                text-decoration: none;
                border-radius: 10px;
            }

            .btn:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to RetainSense!</h1>
            <p>Dear ${username},</p>
            <p>Thank you for signing up for RetainSense, your go-to platform for collecting and analyzing feedback. We're excited to have you on board!</p>
            <p>To get started, simply log in to your account using the email address you provided during signup. If you have any questions or need assistance, our support team is always here to help.</p>
            <p>Click the button below to access your account:</p>
            <p>
                <a class="btn" href="${process.env.CLIENT_URL}">Log In</a>
            </p>
            <p>We hope you have a great experience using RetainSense. If you have any feedback or suggestions, feel free to reach out to us. We're constantly working to improve our platform based on user input.</p>
            <p>Once again, welcome to RetainSense! We look forward to helping you collect valuable feedback and insights.</p>
            <p>Best regards,</p>
            <p>The RetainSense Team</p>
        </div>
    </body>
    </html>
    `;

    return emailHtml;
}