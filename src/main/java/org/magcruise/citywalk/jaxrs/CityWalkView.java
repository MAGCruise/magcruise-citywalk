package org.magcruise.citywalk.jaxrs;

import java.io.File;
import java.util.Map;

import javax.ws.rs.Path;

import org.glassfish.jersey.server.mvc.Viewable;
import org.nkjmlab.webui.common.jaxrs.JaxrsView;
import org.nkjmlab.webui.common.jaxrs.ThymeleafModel;
import org.nkjmlab.webui.common.user.model.UserSession;

@Path("/")
public class CityWalkView extends JaxrsView {

	@Override
	public Viewable getView(String filePathFromViewRoot, Map<String, String[]> params) {
		try {

			File f = new File(filePathFromViewRoot);
			switch (f.getName()) {
			case "":
				response.sendRedirect(getServletUrl() + "/index.html");
				return createView("/index.html", new ThymeleafModel());
			case "/index.html":
			case "/login.html":
			case "/register.html":
				return createView(filePathFromViewRoot, new ThymeleafModel());
			default:
				if (UserSession.of(request).isLogined()) {
					return createView(filePathFromViewRoot, new ThymeleafModel());
				}
				response.sendRedirect(getServletUrl() + "/index.html");
				return createView("/index.html", new ThymeleafModel());
			}

		} catch (Exception e) {
			log.error(e, e);
			throw new RuntimeException(e);
		}

	}

}