package org.magcruise.citywalk.model.json;

public class RegisterResultJson {

	private boolean success;
	private String recommendedUserId;

	public RegisterResultJson(boolean success, String recommended) {
		this.success = success;
		this.recommendedUserId = recommended;
	}

	public boolean isSuccess() {
		return success;
	}

	public void setSuccess(boolean success) {
		this.success = success;
	}

	public String getRecommendedUserId() {
		return recommendedUserId;
	}

	public void setRecommendedUserId(String recommendedUserId) {
		this.recommendedUserId = recommendedUserId;
	}

}
