terminal ID: /[_a-zA-Z][_a-zA-Z0-9]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal BOOLEAN: /\b(?:true|false)\b/;


type Enumeration1 = 'enumElem1' | 'enumElem2' 



interface FSM {
    OwnedStates: State[];
    Initialstates: @State;
}

interface State {
    name: string;
    final: boolean;
    transitions: Transition[];
}

interface Transition {
    name: string;
    state: @State;
}

interface SubState extends State, Transition {
    Parent: @State;
}
