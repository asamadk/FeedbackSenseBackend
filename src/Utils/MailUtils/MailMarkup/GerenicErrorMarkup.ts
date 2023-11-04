export const generateErrorEmailHtml = (
    errorDetails: string,
    errorTime: string,
    errorLocation: string,
    errorType: string
): string => {
    const emailHtml = /*html*/`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Error Notification</title>
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
            <h1>Error Notification</h1>
          <p>Hi There</p>
                        <p>An error occurred at ${errorTime} in ${errorLocation}.</p>
            <p>Error Type: ${errorType}</p>
            <p>Error Details:</p>
            <p>${errorDetails}</p>
            <p>
                Please take necessary action to resolve this issue.
            </p>
            <p>Best regards,</p>
            <p>The FeedbackSense Team</p>
        </div>
    </body>
    </html>
    `;

    return emailHtml;
}
