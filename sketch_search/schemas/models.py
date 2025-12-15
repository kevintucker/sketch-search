from dataclasses import dataclass, field
from typing import List, Dict, Optional


@dataclass
class Character:
    identity: str
    appearance: Dict[str, str] = field(default_factory=dict)
    pose: Optional[str] = None
    expression: Optional[str] = None
    wardrobe: Dict[str, str] = field(default_factory=dict)


@dataclass
class Prop:
    name: str
    placement: Optional[str] = None
    tags: List[str] = field(default_factory=list)


@dataclass
class Environment:
    location: Optional[str] = None
    materials: List[str] = field(default_factory=list)
    weather: Optional[str] = None
    time_of_day: Optional[str] = None


@dataclass
class Camera:
    shot_type: Optional[str] = None
    focal_length: Optional[str] = None
    angle: Optional[str] = None
    framing: Optional[str] = None
    depth_of_field: Optional[str] = None


@dataclass
class Lighting:
    key: Optional[str] = None
    fill: Optional[str] = None
    rim: Optional[str] = None
    direction: Optional[str] = None
    softness: Optional[str] = None
    color_temperature: Optional[str] = None


@dataclass
class Constraints:
    must_not_change: List[str] = field(default_factory=list)


@dataclass
class SceneGraph:
    characters: List[Character] = field(default_factory=list)
    props: List[Prop] = field(default_factory=list)
    environment: Environment = field(default_factory=Environment)
    camera: Camera = field(default_factory=Camera)
    lighting: Lighting = field(default_factory=Lighting)
    mood_style: List[str] = field(default_factory=list)
    constraints: Constraints = field(default_factory=Constraints)


@dataclass
class MotionPlan:
    shot_id: str
    duration_s: int
    camera_motion: List[str] = field(default_factory=list)
    subject_motion: List[str] = field(default_factory=list)
    background_motion: List[str] = field(default_factory=list)
    hard_constraints: List[str] = field(default_factory=list)


def to_dict(obj):
    if hasattr(obj, "__dict__"):
        result = {}
        for k, v in obj.__dict__.items():
            if isinstance(v, list):
                result[k] = [to_dict(x) for x in v]
            else:
                result[k] = to_dict(v)
        return result
    return obj
