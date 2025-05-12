import { Env, version, appKey, platformId } from "./env";

export const env : Env = {
    version: version,
    production: false,
    //apiUrl: "https://localhost:7177/",
    apiUrl: "https://mxrexvs36:446",
    dashboardApi: "https://mxrexvs36:452/api/v1/",
    securityApi: "https://mxrexvs36:451/api/v1/",
    appKey: appKey,
    platformId: platformId,
    cs_orgId: "",
    cs_merchantId: "",
    currentUserToken: ""
}