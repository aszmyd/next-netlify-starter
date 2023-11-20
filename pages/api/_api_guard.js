import 'dotenv/config';
export const checkSiteEnabled = () => {
    if(process.env.SITE_ENABLED !== '1' && process.env.SITE_ENABLED !== 'true') {
        console.log('Site disabled. exiting...');
        throw new Error('Site disabled. exiting...');
    }
}