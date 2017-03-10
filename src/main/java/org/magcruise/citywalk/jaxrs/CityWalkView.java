package org.magcruise.citywalk.jaxrs;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;

import javax.ws.rs.Path;

import org.glassfish.jersey.server.mvc.Viewable;
import org.magcruise.citywalk.CityWalkApplicationContext;
import org.magcruise.citywalk.model.relation.UserAccountsTable;
import org.magcruise.citywalk.model.row.UserAccount;
import org.nkjmlab.util.lang.ExceptionUtils;
import org.nkjmlab.webui.jaxrs.JaxrsView;
import org.nkjmlab.webui.jaxrs.thymeleaf.ThymeleafModel;
import org.nkjmlab.webui.util.servlet.UserSession;

@Path("/")
public class CityWalkView extends JaxrsView {

	private UserAccountsTable users = new UserAccountsTable(
			CityWalkApplicationContext.getDbClient());

	private static final String[] noAuthPathElements = { "index.html", "clear.html",
			"dev.html", "login.html", "signup.html", "how-to-use.html", "troubleshooting.html",
			"intro.html", "help.html", "tutorial.html", "check-environment.html" };

	@Override
	public Viewable getView(String filePathFromViewRoot, Map<String, String[]> params) {
		try {
			if (isRootPath(filePathFromViewRoot)) {
				return redirectTo("/index.html", createModel());
			}
			if (isFromServiceWorker(params)) {
				return createView(filePathFromViewRoot, createModel());
			}

			if (containsNoAuthPathElements(noAuthPathElements, filePathFromViewRoot)) {
				if (filePathFromViewRoot.equals("/signup.html")
						|| filePathFromViewRoot.equals("/check-environment.html")) {
					ThymeleafModel model = createModel();
					Locale lang = params.get("lang") != null
							? Locale.forLanguageTag(params.get("lang")[0]) : Locale.US;
					model.setLocale(lang);
					return createView(filePathFromViewRoot, model);
				}
				if (UserSession.of(request).isLogined()) {
					return createView(filePathFromViewRoot, addUserAccount(createModel()));
				}
				return createView(filePathFromViewRoot, createModel());
			}

			if (UserSession.of(request).isLogined()) {
				return createView(filePathFromViewRoot, addUserAccount(createModel()));
			} else {
				response.sendRedirect(getServletUrl() + "/login.html?msg=nologin&redirect="
						+ getFullRequestUrl());
				return createView("/login.html", createModel());
			}
		} catch (Exception e) {
			log.error(e, e);
			CityWalkApplicationContext.asyncPostMessageToLogSrvChannel(getClass().getSimpleName(),
					":x: ```" + ExceptionUtils.getMessageWithStackTrace(e) + "```");
			try {
				response.sendRedirect(getServletUrl() + "/index.html");
			} catch (IOException e1) {
				e1.printStackTrace();
			}
			return createView("/index.html", new ThymeleafModel());
		}

	}

	private ThymeleafModel createModel() {
		ThymeleafModel model = new ThymeleafModel();
		model.setErrorHandler((t) -> {
			CityWalkApplicationContext.asyncPostMessageToLogSrvChannel(getClass().getSimpleName(),
					":x: ```" + ExceptionUtils.getMessageWithStackTrace(t) + "```");
		});
		return model;
	}

	private ThymeleafModel addUserAccount(ThymeleafModel model) {
		UserAccount ua = users.readByPrimaryKey(getCurrentUserId());
		if (ua == null) {
			return model;
		}
		model.put("currentUser", ua);
		model.setLocale(ua.getLocale());
		return model;
	}

	private boolean isFromServiceWorker(Map<String, String[]> params) {
		for (String key : params.keySet()) {
			if (key.equalsIgnoreCase("serviceWorker")) {
				return true;
			}
		}
		return false;
	}

}