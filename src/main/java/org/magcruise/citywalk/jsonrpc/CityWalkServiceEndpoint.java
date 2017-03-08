package org.magcruise.citywalk.jsonrpc;

import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;

import jp.go.nict.langrid.servicecontainer.handler.annotation.Service;
import jp.go.nict.langrid.servicecontainer.handler.annotation.Services;
import jp.go.nict.langrid.servicecontainer.handler.jsonrpc.servlet.JsonRpcServlet;

@WebServlet(urlPatterns = "/json/*", initParams = {
		@WebInitParam(name = "mapping", value = "CityWalkService:org.magcruise.citywalk.jsonrpc.CityWalkJsonRpcHandler"),
		@WebInitParam(name = "dumpRequests", value = "false"),
		@WebInitParam(name = "additionalResponseHeaders", value = "Access-Control-Allow-Origin: *") })
@Services({ @Service(name = "CityWalkService", impl = CityWalkService.class) })
public class CityWalkServiceEndpoint extends JsonRpcServlet {

}
