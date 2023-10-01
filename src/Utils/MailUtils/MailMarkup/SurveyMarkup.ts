export const generateSurveyFilledEmailHtml = (surveyName: string, responseId: string): string => {
    const emailHtml = /*html*/`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>New Survey Response Notification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
          }
        </style>
      </head>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px">
          <h2>New Survey Response Notification</h2>
          <p>Hello Admin,</p>
          <p>
            A new response has been submitted for the survey. Here are the details:
          </p>
          <ul>
            <li><strong>Survey Name:</strong> ${surveyName}</li>
            <li><strong>Response ID:</strong> ${responseId}</li>
            <li><strong>Date & Time:</strong> ${new Date().toString()}</li>
            <!-- Add more details as needed -->
          </ul>
          <p>
            Please login to the admin dashboard to view the full response and take
            necessary actions.
          </p>
          <p>Thank you!</p>
          <p>Best regards,<br />FeedbackSense Team</p>
        </div>
      </body>
    </html>
    `;

    return emailHtml;
}