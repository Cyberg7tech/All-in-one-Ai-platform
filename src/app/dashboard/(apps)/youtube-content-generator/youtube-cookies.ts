type TypeCookies = {
  domain: string;
  expirationDate: number;
  hostOnly: boolean;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: string;
  secure: boolean;
  session: boolean;
  storeId: string;
  value: string;
  id: number;
};

// TODO: replace the below example value with actual extracted value.
// Follow the documentation for detailed steps - https://docs.builderkit.ai/ai-apps/youtube-content-generator#setup-cookies
const ytCookies: TypeCookies[] = [
  {
    domain: '.youtube.com',
    expirationDate: 1234567890,
    hostOnly: false,
    httpOnly: true,
    name: '---xxx---',
    path: '/',
    sameSite: 'no_restriction',
    secure: true,
    session: false,
    storeId: '0',
    value: '---xxx---',
    id: 1,
  },
];

export default ytCookies;
