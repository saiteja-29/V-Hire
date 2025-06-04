const APPID: number = Number(process.env.REACT_APP_ZEGO_APP_ID) || 0; // Fallback to 0 if undefined
const SERVERSECRET: string = process.env.REACT_APP_ZEGO_SERVER_SECRET || ''; // Fallback to empty string

export { APPID, SERVERSECRET };