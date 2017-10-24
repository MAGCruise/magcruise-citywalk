package org.magcruise.citywalk.model.json.app.task;

import org.magcruise.citywalk.model.json.app.TaskJson;

public class PhotoTask extends TaskContent {

	private String imgSrc;

	@Override
	public TaskJson toTaskJson(String id) {
		TaskJson j = super.toTaskJson(id);
		j.setImgSrc(imgSrc);
		return j;
	}

	public String getImgSrc() {
		return imgSrc;
	}

	public void setImgSrc(String imgSrc) {
		this.imgSrc = imgSrc;
	}

}
