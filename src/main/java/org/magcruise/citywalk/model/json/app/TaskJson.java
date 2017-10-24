package org.magcruise.citywalk.model.json.app;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.apache.logging.log4j.Logger;
import org.nkjmlab.util.log4j.LogManager;

public class TaskJson {

	protected static Logger log = LogManager.getLogger();

	private String id;
	private String taskType;
	private double point;
	private String label;
	private List<String> selections = new ArrayList<>();
	private List<Integer> answerIndexes = new ArrayList<>();
	private List<String> answerTexts = new ArrayList<>();
	private String answerQr;
	private String imgSrc;
	private double activeArea;

	public TaskJson() {
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

	public String getImgSrc() {
		return imgSrc;
	}

	public void setImgSrc(String imgSrc) {
		this.imgSrc = imgSrc;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public double getActiveArea() {
		return activeArea;
	}

	public void setActiveArea(double activeArea) {
		this.activeArea = activeArea;
	}

}
