package org.magcruise.citywalk.model.json;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.magcruise.citywalk.model.row.Task;
import org.magcruise.citywalk.model.task.DescriptionTask;
import org.magcruise.citywalk.model.task.PhotoTask;
import org.magcruise.citywalk.model.task.QrCodeTask;
import org.magcruise.citywalk.model.task.SelectionTask;
import org.magcruise.citywalk.model.task.TaskContent;

public class TaskJson {

	private String id;
	private String taskType;
	private double point;
	private String label;
	private List<String> selections = new ArrayList<>();
	private List<Integer> answerIndexes = new ArrayList<>();
	private List<String> answerTexts = new ArrayList<>();
	private String answerQr;

	public TaskJson() {
	}

	public TaskJson(Task task) {
		this.id = task.getId();
		TaskContent content = task.getContentObject();
		this.taskType = content.getClass().getSimpleName();
		this.label = content.getLabel();
		this.point = content.getPoint();

		if (content.getInstanceClass().equals(SelectionTask.class.getName())) {
			SelectionTask t = (SelectionTask) content;
			selections.addAll(t.getSelections());
			answerIndexes.addAll(t.getAnswerIndexes());
		} else if (content.getInstanceClass().equals(DescriptionTask.class.getName())) {
			DescriptionTask t = (DescriptionTask) content;
			answerTexts.addAll(t.getAnswerTexts());
		} else if (content.getInstanceClass().equals(PhotoTask.class.getName())) {
		} else if (content.getInstanceClass().equals(QrCodeTask.class.getName())) {
			QrCodeTask t = (QrCodeTask) content;
			answerQr = t.getAnswerQr();
		}
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getTaskType() {
		return taskType;
	}

	public void setTaskType(String taskType) {
		this.taskType = taskType;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public List<String> getSelections() {
		return selections;
	}

	public void setSelections(List<String> selections) {
		this.selections = selections;
	}

	public List<Integer> getAnswerIndexes() {
		return answerIndexes;
	}

	public void setAnswerIndexes(List<Integer> answerIndexes) {
		this.answerIndexes = answerIndexes;
	}

	public List<String> getAnswerTexts() {
		return answerTexts;
	}

	public void setAnswerTexts(List<String> answerTexts) {
		this.answerTexts = answerTexts;
	}

	public double getPoint() {
		return point;
	}

	public void setPoint(double score) {
		this.point = score;
	}

	public String getAnswerQr() {
		return answerQr;
	}

	public void setAnswerQr(String answerQr) {
		this.answerQr = answerQr;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

}
