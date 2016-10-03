package org.magcruise.citywalk.model.json;

public class RegisterResultJson {

	private boolean register;
	private String recommendedUserId;

	public RegisterResultJson(boolean register, String recommended) {
		this.register = register;
		this.recommendedUserId = recommended;
	}

	public boolean isRegister() {
		return register;
	}

	public void setRegister(boolean register) {
		this.register = register;
	}

	public String getRecommendedUserId() {
		return recommendedUserId;
	}

	public void setRecommendedUserId(String recommendedUserId) {
		this.recommendedUserId = recommendedUserId;
	}

}
