  wrapper = function keys(obj) {
    throwIfNullUndefined(obj);
    if (obj instanceof Interpreter.Object) {
      obj = obj.properties;
    }
    return thisInterpreter.nativeToPseudo(Object.keys(obj));
  };
  this.setProperty(
    this.OBJECT,
    "keys",
    this.createNativeFunction(wrapper, false),
    Interpreter.NONENUMERABLE_DESCRIPTOR
  );
