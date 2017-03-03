package org.magcruise.citywalk.model.input;

import java.util.HashMap;
import java.util.Map;

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

	public Map<String, String> toMap() {
		Map<String, String> inputs = new HashMap<>();
		inputs.put("value", value);
		return inputs;
	}

}
