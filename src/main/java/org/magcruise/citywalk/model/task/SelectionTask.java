package org.magcruise.citywalk.model.task;

import java.util.ArrayList;
import java.util.List;

public class SelectionTask extends TaskContent {

	private List<String> selections = new ArrayList<>();
	private List<Integer> answerIndexes = new ArrayList<>();

	public SelectionTask() {
	}

	public SelectionTask(String label, List<String> selections, List<Integer> answerIndexes,
			double point, boolean checkIn, int activeArea) {
		super(checkIn, point, label, activeArea);
		this.selections.addAll(selections);
		setAnswerIndexes(answerIndexes);
	}

	public List<String> getSelections() {
		return selections;
	}

	public void setSelections(List<String> selections) {
		this.selections.addAll(selections);
	}

	public List<Integer> getAnswerIndexes() {
		return answerIndexes;
	}

	public void setAnswerIndexes(List<Integer> answerIndexes) {
		this.answerIndexes = answerIndexes;
	}

}
