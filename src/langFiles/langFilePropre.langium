grammar LangFileCli

terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal BOOLEAN returns boolean : /true|false/;


entry FSMModel returns FSM:
    "[" (OwnedStates += State ("," OwnedStates += State)*)? "]";

FSM returns FSM:
    "["
        (OwnedStates += State
        ("," OwnedStates += State)*)?
    "]"
    Initialstates = [State: ID];


State returns State:
    name = STRING
    final = BOOLEAN
    "["
        (transitions += Transition
        ("," transitions += Transition)*)?
    "]";


Transition returns Transition:
    name = STRING
    
    state = [State: ID];




interface FSM {
    OwnedStates?: State[];
    Initialstates?: @State;
}

interface State {
    name: string;
    final: boolean;
    transitions?: Transition[];
}

interface Transition {
    name: string;
    state?: @State;
}
