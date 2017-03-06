package org.magcruise.citywalk.jsonrpc;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class UserRequest {

	private HttpServletRequest request;

	public UserRequest(HttpServletRequest request) {
		this.request = request;
	}

	public static UserRequest of(HttpServletRequest request) {
		return new UserRequest(request);
	}

	@Override
	public String toString() {
		return new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE).build();
	}

}
