import { AccountInfo } from '@azure/msal-browser';

export type ProfileType = {
    name?: string;
    email?: string;
    id?: string;
    idTokenClaims?: AccountInfo["idTokenClaims"]
};