package org.magcruise.citywalk.model.json.app.task;

import org.magcruise.citywalk.model.json.app.TaskJson;

public class QrCodeTask extends TaskContent {

	private String answerQr;

	@Override
	public TaskJson toTaskJson(String id) {
		TaskJson j = super.toTaskJson(id);
		j.setAnswerQr(answerQr);
		return j;
	}

	public String getAnswerQr() {
		return answerQr;
	}

	public void setAnswerQr(String answerQr) {
		this.answerQr = answerQr;
	}

}
