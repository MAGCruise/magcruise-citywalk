package org.magcruise.citywalk.jsonrpc;

import org.magcruise.citywalk.ApplicationContext;
import org.nkjmlab.webui.jsonrpc.JsonRpcDynamicHandlerWithErrorNotifierToSlack;

public class CityWalkJsonRpcHandler extends JsonRpcDynamicHandlerWithErrorNotifierToSlack {

	public CityWalkJsonRpcHandler() {
		this.postUrl = ApplicationContext.SLACK_URL;
	}

}
