package entities

import (
	"github.com/SpaceHexagon/convolvr/services/engine/components"
	"github.com/SpaceHexagon/convolvr/services/engine/types"
	"github.com/pborman/uuid"
)

type Entity struct {
	Id         string                  `json:"id"`
	Aspects    []*types.Aspect         `json:"aspects"`
	Components []*components.Component `json:"components"`
	Position   *types.Position         `json:"pos"`
	Quaternion *types.Quaternion       `json:"quat"`
}

func NewEntity(components []*components.Component, aspects []*types.Aspect) *Entity { // components []*components.Component
	return &Entity{
		Id:         uuid.NewUUID().String(),
		Aspects:    aspects,
		Components: components,
		Position:   &types.Position{},
		Quaternion: &types.Quaternion{},
	}
}

func (e *Entity) Update(p *types.Position, q *types.Quaternion) {
	e.Position.X = p.X
	e.Position.Y = p.Y
	e.Position.Z = p.Z
	e.Quaternion.X = q.X
	e.Quaternion.Y = q.Y
	e.Quaternion.Z = q.Z
	e.Quaternion.W = q.W
}
