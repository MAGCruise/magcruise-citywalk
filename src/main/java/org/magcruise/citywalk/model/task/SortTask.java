package org.magcruise.citywalk.model.task;

import java.util.ArrayList;
import java.util.List;

public class SortTask extends TaskContent {

	private List<String> selections = new ArrayList<>();
	private int answerIndex = -1;

	public SortTask() {
	}

	public SortTask(String label, List<String> selections, int answerIndex,
			double point, boolean checkIn, int activeArea) {
		super(checkIn, point, label, activeArea);
		this.selections.addAll(selections);
		setAnswerIndex(answerIndex);
	}

	public List<String> getSelections() {
		return selections;
	}

	public void setSelections(List<String> selections) {
		this.selections.addAll(selections);
	}

	public int getAnswerIndex() {
		return answerIndex;
	}

	public void setAnswerIndex(int answerIndex) {
		this.answerIndex = answerIndex;
	}

}
