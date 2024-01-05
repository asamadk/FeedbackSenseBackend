import { Metric } from "../../../Core/PerformanceMetricsCollector";

export const generateHealthCheckerMail = (
    errors: string[],
    count: number,
    performanceMetrics: Metric[]
): string => {
    let emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>System Health and Error Report</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 700px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1, h2 {
                color: #333;
                text-align: start;
            }
            ul, .status-list {
                list-style-type: none;
                padding: 0;
            }
            li, .status-item {
                background-color: #f9f9f9;
                margin-bottom: 10px;
                padding: 10px;
                border-left: 5px solid #5cb85c; /* green for status */
            }
            li.error-item {
                border-left-color: #d9534f; /* red for errors */
            }
            .footer {
                margin-top: 20px;
                text-align: start;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Status Indicators</h2>
            <ul class="status-list">`;

    performanceMetrics.forEach((metric) => {
        emailHtml += `<li class="status-item">${metric.name}: ${metric.value}</li>`;
    });

    emailHtml += `
            </ul>
            <h2>Today's Errors</h2>
            <p>A total of ${count} error(s) have been reported:</p>
            <ul>`;

    errors.forEach((error, index) => {
        emailHtml += `<li class="error-item">Error ${index + 1}: ${error}</li>`;
    });

    emailHtml += `
            </ul>
            <div class="footer">
                <p>Please review the above information and take the necessary actions.</p>
                <p>Best regards,</p>
                <p>Your Development Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
    return emailHtml;
}


// export const generateHealthCheckerMail = (errors: string[], count: number): string => {
//     let emailHtml = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <title>Error Report</title>
//         <style>
//             body {
//                 font-family: Arial, sans-serif;
//                 background-color: #f5f5f5;
//             }
//             .container {
//                 max-width: 700px;
//                 margin: 20px auto;
//                 padding: 20px;
//                 background-color: #fff;
//                 border-radius: 5px;
//                 box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//             }
//             h1 {
//                 color: #333;
//                 text-align: center;
//             }
//             ul {
//                 list-style-type: none;
//                 padding: 0;
//             }
//             li {
//                 background-color: #f9f9f9;
//                 margin-bottom: 10px;
//                 padding: 10px;
//                 border-left: 5px solid #d9534f;
//             }
//             .footer {
//                 margin-top: 20px;
//                 text-align: center;
//             }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <h1 style="text-align : start;" >Error Report</h1>
//             <p>A total of ${count} error(s) have been reported:</p>
//             <ul>`;

//     errors.forEach((error, index) => {
//         emailHtml += `<li>Error ${index + 1}: ${error}</li>`;
//     });

//     emailHtml += `
//             </ul>
//             <div  style="text-align : start;" class="footer">
//                 <p>Please review the errors and take the necessary actions.</p>
//                 <p>Best regards,</p>
//                 <p>Your Development Team</p>
//             </div>
//         </div>
//     </body>
//     </html>
//     `;
//     return emailHtml;
// }