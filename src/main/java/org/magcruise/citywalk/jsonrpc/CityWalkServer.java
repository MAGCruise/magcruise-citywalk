package org.magcruise.citywalk.jsonrpc;

import java.io.File;
import java.io.IOException;
import java.io.Writer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;
import org.apache.logging.log4j.Logger;
import org.nkjmlab.util.log4j.LogManager;

public class CityWalkServer {
	protected static Logger log = LogManager.getLogger();

	private static Tomcat tomcat;
	private static int port = 8080;

	private static String rootContextPath = "/magcruise-citywalk";
	private static String docBase = new File("src/main/webapp/").getAbsolutePath();

	public static void main(String[] args) throws Exception {
		initByDefault();
		startAndAwait();
	}

	public static void initByDefault() {
		init(port);
	}

	public static void init(int port) {
		CityWalkServer.port = port;

		tomcat = new Tomcat();
		tomcat.setPort(port);
		addWebapp();
		addWebListner();
		addJsonRpcService();

	}

	private static void addWebListner() {
	}

	private static void addWebapp() {
		try {
			tomcat.addWebapp(rootContextPath, docBase);
		} catch (ServletException e) {
			log.error(e, e);
			throw new RuntimeException(e);
		}
	}

	public static void startAndAwait() {
		try {
			tomcat.start();
		} catch (LifecycleException e) {
			log.error(e, e);
			throw new RuntimeException(e);
		}
		tomcat.getServer().await();
	}

	protected static void addJsonRpcService() {
		Context ctx = tomcat.addContext(rootContextPath + "/json", docBase);

		Tomcat.addServlet(ctx, "CityWalkService", new CityWalkServiceEndpoint())
				.addMapping("/");

	}

	protected static void addServlet() {
		Context ctx = tomcat.addContext(rootContextPath + "/servlet", docBase);
		Tomcat.addServlet(ctx, "hello", new HttpServlet() {
			@Override
			protected void service(HttpServletRequest req, HttpServletResponse resp)
					throws ServletException, IOException {
				Writer w = resp.getWriter();
				w.write("Hello, World!");
				w.flush();
			}
		}).addMapping("/hello");
	}

}
