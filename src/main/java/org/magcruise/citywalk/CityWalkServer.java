package org.magcruise.citywalk;

import java.io.File;

import org.magcruise.citywalk.jsonrpc.CityWalkJsonRpcServiceEndpoint;
import org.nkjmlab.webui.util.tomcat.TomcatServer;

public class CityWalkServer {

	private static String rootContextPath = "/magcruise-citywalk";
	private static File docBase = new File("src/main/webapp/");

	public static void main(String[] args) throws Exception {
		TomcatServer server = new TomcatServer(8080);
		server.addWebapp(rootContextPath, docBase);
		server.addServletAndMappping(rootContextPath + "/json", docBase, "CityWalkService",
				new CityWalkJsonRpcServiceEndpoint(), "/");
		server.startAndAwait();
	}

}
