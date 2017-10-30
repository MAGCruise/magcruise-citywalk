package org.magcruise.citywalk.model.json.file;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class ContentJson {

	private String instanceClass;
	private boolean checkin = false;
	private double point;
	private String label = "";
	private List<String> selections = new ArrayList<>();
	private List<Integer> answerIndexes = new ArrayList<>();
	private List<String> answerTexts = new ArrayList<>();
	private String answerQr = "";
	private String imgSrc = "";
	private int activeArea = -1;

	public ContentJson() {
	}

	public ContentJson(String instanceClass, boolean checkin, double point, String label,
			String answerQr, String imgSrc) {
		super();
		this.instanceClass = instanceClass;
		this.checkin = checkin;
		this.point = point;
		this.label = label;
		this.answerQr = answerQr;
		this.imgSrc = imgSrc;
	}

	public String getInstanceClass() {
		return instanceClass;
	}

	public void setInstanceClass(String instanceClass) {
		this.instanceClass = instanceClass;
	}

	public boolean isCheckin() {
		return checkin;
	}

	public void setCheckin(boolean checkin) {
		this.checkin = checkin;
	}

	public double getPoint() {
		return point;
	}

	public void setPoint(double point) {
		this.point = point;
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

	public int getActiveArea() {
		return activeArea;
	}

	public void setActiveArea(int activeArea) {
		this.activeArea = activeArea;
	}

}
