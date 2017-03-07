package org.magcruise.citywalk.jaxrs;

import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import org.glassfish.jersey.server.mvc.Viewable;
import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.relation.UserAccountsTable;
import org.magcruise.citywalk.model.row.UserAccount;
import org.nkjmlab.util.json.JsonUtils;
import org.nkjmlab.webui.jaxrs.JaxrsView;
import org.nkjmlab.webui.jaxrs.thymeleaf.ThymeleafModel;
import org.nkjmlab.webui.util.servlet.UserSession;

@Path("/")
public class CityWalkView extends JaxrsView {

	private UserAccountsTable users = new UserAccountsTable(ApplicationContext.getDbClient());

	private static final String[] noAuthPathElements = { "index.html", "clear.html",
			"dev.html", "login.html", "signup.html", "how-to-use.html", "troubleshooting.html",
			"intro.html", "help.html", "tutorial.html", "check-environment.html" };

	@Override
	public Viewable getView(String filePathFromViewRoot, Map<String, String[]> params) {
		try {
			if (isRootPath(filePathFromViewRoot)) {
				return redirectTo("/index.html");
			}
			if (isFromServiceWorker(params)) {
				return createView(filePathFromViewRoot, new ThymeleafModel());
			}

			if (containsNoAuthPathElements(noAuthPathElements, filePathFromViewRoot)) {
				if (filePathFromViewRoot.equals("/signup.html")
						|| filePathFromViewRoot.equals("/check-environment.html")) {
					ThymeleafModel model = new ThymeleafModel();
					Locale lang = params.get("lang") != null
							? Locale.forLanguageTag(params.get("lang")[0]) : Locale.US;
					model.setLocale(lang);
					return createView(filePathFromViewRoot, model);
				}
				if (UserSession.of(request).isLogined()) {
					return createView(filePathFromViewRoot, createThymeLeafModelWithUserAccount());
				}
				return createView(filePathFromViewRoot, new ThymeleafModel());
			}

			if (UserSession.of(request).isLogined()) {
				return createView(filePathFromViewRoot, createThymeLeafModelWithUserAccount());
			} else {
				response.sendRedirect(
						getServletUrl() + "/login.html?msg=nologin&redirect="
								+ getFullRequestUrl());
				return createView("/login.html", new ThymeleafModel());
			}
		} catch (Exception e) {
			log.error(e, e);
			try {
				response.sendRedirect(getServletUrl() + "/index.html");
			} catch (IOException e1) {
				e1.printStackTrace();
			}
			return createView("/index.html", new ThymeleafModel());
		}

	}

	protected ThymeleafModel createThymeLeafModelWithUserAccount() {
		UserAccount ua = users.readByPrimaryKey(getCurrentUserId());
		ThymeleafModel model = new ThymeleafModel();
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

	@GET
	@Produces({ "application/x-msgpack" })
	@Path("add")
	public Map<Integer, Integer> calc(@QueryParam("left") int left,
			@QueryParam("right") int right) {
		Map<Integer, Integer> result = new HashMap<>();
		result.put(left, right);
		return result;
	}

	@GET
	@Produces({ "application/json" })
	@Path("addJson")
	public String calcJson(@QueryParam("left") int left,
			@QueryParam("right") int right) {
		Map<Integer, Integer> result = new HashMap<>();
		result.put(left, right);
		return JsonUtils.encode(result);
	}

}