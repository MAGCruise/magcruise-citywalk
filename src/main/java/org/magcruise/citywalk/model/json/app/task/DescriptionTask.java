package org.magcruise.citywalk.model.json.app.task;

import java.util.ArrayList;
import java.util.List;

import org.magcruise.citywalk.model.json.app.TaskJson;

public class DescriptionTask extends TaskContent {

	private List<String> answerTexts = new ArrayList<>();

	@Override
	public TaskJson toTaskJson(String id) {
		TaskJson j = super.toTaskJson(id);
		j.setAnswerTexts(answerTexts);
		return j;
	}

	public List<String> getAnswerTexts() {
		return answerTexts;
	}

	public void setAnswerTexts(List<String> answerTexts) {
		this.answerTexts = answerTexts;
	}

}
