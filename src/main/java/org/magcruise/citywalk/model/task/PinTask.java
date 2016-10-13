package org.magcruise.citywalk.model.task;

import java.util.ArrayList;
import java.util.List;

public class PinTask extends TaskContent {

	private List<String> answerTexts = new ArrayList<>();

	public List<String> getAnswerTexts() {
		return answerTexts;
	}

	public void setAnswerTexts(List<String> answerTexts) {
		this.answerTexts = answerTexts;
	}

}
