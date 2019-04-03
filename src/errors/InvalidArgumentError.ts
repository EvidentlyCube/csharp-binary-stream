
export class InvalidArgumentError extends Error {
	public argumentName: string;
	public argumentValue: unknown;

	public constructor(message: string, argumentName: string, argumentValue: unknown)
	{
		super(message);

		this.argumentName = argumentName;
		this.argumentValue = argumentValue;
	}
}