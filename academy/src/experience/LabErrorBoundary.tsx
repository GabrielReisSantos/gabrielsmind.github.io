import {Component,type ErrorInfo,type ReactNode} from 'react';
import {AlertTriangle,ArrowLeft,RotateCcw} from 'lucide-react';

type Props={children:ReactNode;route:string;onReturn:()=>void};
type State={hasError:boolean};
/** An individual workbench failing must not blank the entire Academy shell. */
export default class LabErrorBoundary extends Component<Props,State>{
 state:State={hasError:false};
 static getDerivedStateFromError():State{return {hasError:true};}
 componentDidCatch(error:Error,info:ErrorInfo){
  // Diagnostics are local to developer tools; do not transmit notes or saved progress.
  console.error(`CyberLab route ${this.props.route} could not render`,error,info.componentStack);
 }
 render(){if(!this.state.hasError)return this.props.children;
  return <section className="ux-failure" role="alert" aria-labelledby="ux-failure-title">
   <AlertTriangle size={34}/><h1 id="ux-failure-title">This workbench couldn't load.</h1>
   <p>Your learning progress has not been cleared. You can return to the academy or reload the page and try again.</p>
   <div className="ux-failure-actions"><button onClick={()=>window.location.reload()}><RotateCcw size={17}/> Reload workbench</button><button onClick={this.props.onReturn}><ArrowLeft size={17}/> Back to Home</button></div>
  </section>;
 }
}
