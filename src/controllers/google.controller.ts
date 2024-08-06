
// import { Controller, Get, Route, Request, Res, TsoaResponse } from 'tsoa';
// import { Request as ExRequest } from 'express';
// import { randomBytes } from 'crypto';
// import axios from 'axios';

// // interface TokenResponse {
// //     id_token?: string;
// //     access_token?: string;
// //     refresh_token?: string;
// //     error?: string;
// //     error_description?: string;
// // }

// declare module 'express-session' {
//     interface Session {
//         state?: string;
//     }
// }


// @Route("auth")
// export class AuthController extends Controller {
//     @Get("/google-sign-in")
//     public async googleSignIn(
//         @Request() request: ExRequest,
//         @Res() redirect: TsoaResponse<302, void>
//     ): Promise<void> {
//         const state = randomBytes(16).toString('hex');
//         request.session.state = state; // Store state in session
//         console.log(`Generated state: ${state}`);

//         const authorizeParams = new URLSearchParams({
//             response_type: 'code',
//             client_id: "18sgr6b2sl2edjg1hmju3odq3u", // Your Cognito app client ID
//             redirect_uri: "http://localhost:3000/auth/callback", // Your app's callback URL
//             state: state,
//             identity_provider: 'Google',
//             scope: 'profile email openid'
//         });

//         redirect(302, undefined, { Location: `https://monoreposimple.auth.us-east-1.amazoncognito.com/oauth2/authorize?${authorizeParams.toString()}` });
//     }

//     // @Get('/facebook-sign-in')
//     // public async facebookSignIn(
//     //     @Request() request: ExRequest,
//     //     @Res() redirect: TsoaResponse<302, void>
//     // ): Promise<void> {
//     //     const state = randomBytes(16).toString('hex');
//     //     request.session.state = state; // Store state in session
//     //     console.log(`Generated state: ${state}`);

//     //     const authorizeParams = new URLSearchParams({
//     //         response_type: 'code',
//     //         client_id: '25lsujhscen9vlckaind375hej', // Your Cognito app client ID
//     //         redirect_uri: 'http://localhost:3001/auth/callback', // Your app's callback URL
//     //         state: state,
//     //         identity_provider: 'Facebook',
//     //         scope: 'public_profile email'
//     //     });

//     //     const redirectUrl = `https://lomnov.auth.us-east-1.amazoncognito.com/oauth2/authorize?${authorizeParams.toString()}`;
//     //     console.log(`Redirecting to: ${redirectUrl}`);
//     //     redirect(302, undefined, { Location: redirectUrl });
//     // }
//     // @Get('/facebook-sign-in')
//     // public async facebookSignIn(
//     //     @Request() request: ExRequest,
//     //     @Res() redirect: TsoaResponse<302, void>
//     // ): Promise<void> {
//     //     try {
//     //         // Generate a random state value
//     //         const state = randomBytes(16).toString('hex');
//     //         request.session.state = state; // Store the state in session securely

//     //         console.log(`Generated state: ${state}`);

//     //         // Construct the URL for Cognito OAuth2 authorization
//     //         const authorizeParams = new URLSearchParams({
//     //             response_type: 'code',
//     //             client_id: '18sgr6b2sl2edjg1hmju3odq3u', // Replace with your Cognito app client ID
//     //             redirect_uri: 'http://localhost:3000/auth/callback', // Replace with your app's callback URL
//     //             state: state,
//     //             identity_provider: 'Facebook',
//     //             scope: 'public_profile email'
//     //         });

//     //         // Construct the full redirect URL
//     //         const redirectUrl = `https://monoreposimple.auth.us-east-1.amazoncognito.com/oauth2/authorize?${authorizeParams.toString()}`;
//     //         console.log(`Redirecting to: ${redirectUrl}`);

//     //         // Redirect the user to the Cognito authorization URL
//     //         redirect(302, undefined, { Location: redirectUrl });

//     //     } catch (error) {
//     //         console.error('Error during Facebook sign-in:', error);
//     //         // You might want to handle the error differently, such as rendering an error page or sending a response.
//     //         throw new Error('Failed to initiate Facebook sign-in');
//     //     }
//     // }


//     @Get("/callback")
//     public async callback(
//         @Request() request: ExRequest,
//         @Res() badRequest: TsoaResponse<400, { error: string; error_description: string }>,
//         @Res() redirect: TsoaResponse<302, void>
//     ): Promise<void> {
//         try {
//             const code = request.query.code as string;
//             console.log(code)
//             const error = request.query.error as string;

//             if (error || !code) {
//                 return badRequest(400, { error: error || 'Unknown error', error_description: 'No authorization code found' });
//             }

//             const authorizationHeader = `Basic ${Buffer.from(`18sgr6b2sl2edjg1hmju3odq3u:1tbpib6050isa0d9l4sj6lrie0v1kt32nrermiquqcon1jtja7c7`).toString('base64')}`;

//             const params = new URLSearchParams({
//                 grant_type: 'authorization_code',
//                 code: code,
//                 client_id: "18sgr6b2sl2edjg1hmju3odq3u",
//                 redirect_uri: "http://localhost:3000/auth/callback"
//             });

//             const response = await axios.post(`https://monoreposimple.auth.us-east-1.amazoncognito.com/oauth2/token`, params, {
//                 headers: {
//                     Authorization: authorizationHeader,
//                     'Content-Type': 'application/x-www-form-urlencoded'
//                 }
//             });

//             const data = response.data;

//             if (!data.access_token || !data.id_token) {
//                 return badRequest(400, { error: 'No tokens received', error_description: 'Failed to retrieve tokens' });
//             }

//             // Set cookies or handle tokens as needed
//             request.res?.cookie('access_token', data.access_token);
//             request.res?.cookie('id_token', data.id_token);
//             request.res?.cookie('refresh_token', data.refresh_token);

//             return redirect(302, undefined, { Location: '/' });
//         } catch (error: any) {
//             console.error('Callback error:', error);
//             return badRequest(400, { error: 'server_error', error_description: 'An error occurred on the server' });
//         }
//     }
// }