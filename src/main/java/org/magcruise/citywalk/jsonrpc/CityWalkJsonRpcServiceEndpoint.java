package org.magcruise.citywalk.jsonrpc;

import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;

import jp.go.nict.langrid.servicecontainer.handler.annotation.Service;
import jp.go.nict.langrid.servicecontainer.handler.annotation.Services;
import jp.go.nict.langrid.servicecontainer.handler.jsonrpc.servlet.JsonRpcServlet;

@WebServlet(urlPatterns = "/json/*", initParams = {
		@WebInitParam(name = "mapping", value = "CityWalkService:"
				+ "org.nkjmlab.webui.jsonrpc.JsonRpcDynamicHandlerWithErrorNotifierToSlack" + ","
				+ "CityWalkAdminService:"
				+ "org.nkjmlab.webui.jsonrpc.JsonRpcDynamicHandlerWithErrorNotifierToSlack"),
		@WebInitParam(name = "dumpRequests", value = "false"),
		@WebInitParam(name = "additionalResponseHeaders", value = "Access-Control-Allow-Origin: *") })
@Services({ @Service(name = "CityWalkService", impl = CityWalkService.class),
		@Service(name = "CityWalkAdminService", impl = CityWalkAdminService.class) })
public class CityWalkJsonRpcServiceEndpoint extends JsonRpcServlet {

}
