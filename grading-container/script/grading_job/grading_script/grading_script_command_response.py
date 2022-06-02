class GradingScriptCommandResponse:
  """
  Response from the execution of a command when running a grading script. 
  Users can query if the response was an error, the output from the command,
  the next place to go (i.e., next command | \"output\" | \"abort\"), and the 
  original command that was executed.

  Possibilities:
    - isError() == true && (next == "abort" || next == "<int>")
    - isError() == false && (next == "output" || next == "<int>")
  """

  def __init__(self, isError: bool, output: str, next: str, cmd: str, 
    status_code: int, timed_out: bool = False) -> None:
    self.__isError = isError
    self.__output = output
    self.__next = next
    self.__cmd = cmd
    self.__status_code = status_code
    self.__timed_out = timed_out
  
  def is_error(self) -> bool:
    return self.__isError
  
  def get_output(self) -> str:
    return self.__output
  
  def get_next(self) -> str:
    return self.__next
  
  def get_original_cmd(self) -> str:
    return self.__cmd

  def get_status_code(self) -> int:
    return self.__status_code

  def did_time_out(self) -> bool:
    return self.__timed_out
