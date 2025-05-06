import { Env, version, appKey, platformId,token } from "./env";

//export const api_endpoint = "https://localhost:7177";//api que uso para obtener los registros que quiero
export const api_endpoint = "https://mxrexvs36:446";
export const api_security_endpoint = "https://mxrexvs36:451/api/v1/";

export const env : Env = {
    version: version,
    production : false,
    apiUrl : api_endpoint,
    dashboardApi: "http://mxrexsv18/dashboard/api/v1/",
    securityApi: api_security_endpoint,
    appKey : appKey,
    currentUserToken: token,
    platformId: platformId,
    cs_orgId: "",
    cs_merchantId: ""
}