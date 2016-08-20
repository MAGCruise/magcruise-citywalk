package org.magcruise.citywalk.model.input;

public class SelectionInput extends Input {

	private String value;

	public static void main(String[] args) {
		System.out.println(new SelectionInput("1").encodeToJson());
	}

	public SelectionInput() {
	}

	public SelectionInput(String value) {
		this.setValue(value);
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

}