/**
 * 基础样式化组件库
 * 使用样式化组件工厂创建的常用UI组件
 */
import { StyledComponentFactories } from '../../utils/styledComponentUtils';
import {
  containerStyles,
  textStyles,
  headingStyles,
  inputStyles,
  buttonStyles,
  StyledComponents
} from './styledComponents.utils';

export const StyledContainer = StyledComponentFactories.createContainer('Container', containerStyles);



export const StyledText = StyledComponentFactories.createText('Text', textStyles);



export const StyledHeading = StyledComponentFactories.createHeading('Heading', headingStyles);



export const StyledInput = StyledComponentFactories.createInput('Input', inputStyles);



export const StyledButton = StyledComponentFactories.createButton('Button', buttonStyles);

export { StyledComponents };
export default StyledComponents;