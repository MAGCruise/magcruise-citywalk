package org.magcruise.citywalk.model.input;

import org.nkjmlab.util.json.JsonObject;

public class Input extends JsonObject<Input> {

	private String value;

	public Input() {
	}

	public Input(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

}
