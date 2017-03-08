package org.magcruise.citywalk.jsonrpc;

import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;

import org.magcruise.citywalk.jsonrpc.langrid.CityWalkJsonRpcServlet;

import jp.go.nict.langrid.servicecontainer.handler.annotation.Service;
import jp.go.nict.langrid.servicecontainer.handler.annotation.Services;

@WebServlet(urlPatterns = "/json-admin/*", initParams = {
		@WebInitParam(name = "dumpRequests", value = "false"),
		@WebInitParam(name = "additionalResponseHeaders", value = "Access-Control-Allow-Origin: *") })
@Services({ @Service(name = "CityWalkAdminService", impl = CityWalkAdminService.class) })
public class CityWalkAdminServiceEndpoint extends CityWalkJsonRpcServlet {

}
