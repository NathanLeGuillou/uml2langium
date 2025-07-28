grammar FinalStateMachine

entry Model returns Model:
    states+=State*;

hidden terminal WS: /\s+/;

terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal ID: /[_a-zA-Z][\w_]*/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;


State returns State:
    'state' name=ID
    "["
        (transitions+= Transition
        ("," transitions+= Transition)*)?
    "]"
    initial?='initial'?
    final?='final'?;

Transition returns Transition: 
    content=STRING
    '->' outState=[State:ID];


interface State {
    name: string
    transitions: Transition[]
    initial: boolean
    final: boolean
}

interface Transition {
    content: string
    outState: @State
}

interface Model {
    states: State[]
}
